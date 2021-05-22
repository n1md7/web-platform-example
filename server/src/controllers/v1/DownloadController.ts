import * as fs from "fs";
import Joi from "joi";
import path from "path";
import config from "../../config";
import FileModel, {FileType} from "../../models/FileModel";
import {HttpCode} from "../../types/errorHandler";
import {MyContext} from "../../types/koa";
import Controller, {UserInputValidationError} from "../Controller";

// Pattern is hex value of file hash (checksum - SHA256)
const pattern = new RegExp(/^[A-Fa-f0-9]{64}$/);
const FileDownloadParams = Joi.object({
  fileHash: Joi.string().regex(pattern).label('File hash value'),
});

class DownloadController extends Controller {
  public async downloadFile(ctx: MyContext): Promise<void> {
    const validatedParam = DownloadController.assert<{ fileHash: string }>(FileDownloadParams, ctx.params);
    const file = await FileModel.findOne({
      where: {
        name: validatedParam.fileHash
      }
    }) as FileType;

    if (!file) {
      throw new UserInputValidationError(DownloadController.composeJoyErrorDetails([{
          message: 'File not found in database',
          key: 'fileHash',
          value: validatedParam.fileHash
        }]), HttpCode.notFound
      );
    }

    const filePath = path.join(config.server.uploadDir, file.name + file.extension);
    if (!fs.existsSync(filePath)) {
      throw new UserInputValidationError(DownloadController.composeJoyErrorDetails([{
          message: 'File not found in server',
          key: 'fileHash',
          value: validatedParam.fileHash
        }]), HttpCode.notFound
      );
    }

    ctx.body = fs.createReadStream(filePath);
    // Specifying original name so user will be downloading with that name
    ctx.set('Content-disposition', `attachment; filename=${file.originalName}`);
    ctx.set('Content-type', file.mime);
    // Ignore default behaviour and force download all kind of files
    ctx.set('Content-Type', 'application/force-download');
  }

}

export default new DownloadController;
import Joi from "joi";
import TemplateGroupModel, {TemplateGroupStatus} from "../../models/TemplateGroupModel";
import TemplateModel, {TemplateStatus} from "../../models/TemplateModel";
import TemplateQuestionModel, {TemplateQuestionStatus} from "../../models/TemplateQuestionModel";
import {HttpCode} from "../../types/errorHandler";
import {MyContext} from "../../types/koa";

export const newTemplateSchema = Joi.object({
  name: Joi.string().min(6).max(128).required().label('Template Name'),
});

class TemplateController {
  public async createNewTemplate(ctx: MyContext): Promise<void> {
    const validation = newTemplateSchema.validate(ctx.request.body);
    if (validation.error as Joi.ValidationError) {
      ctx.throw(HttpCode.badRequest, validation.error.details.pop().message);
    }

    ctx.body = await TemplateModel.create({
      name: validation.value.name,
      status: TemplateStatus.active
    });

    ctx.status = HttpCode.created;
  }

  public async getTemplateList(ctx: MyContext): Promise<void> {
    ctx.body = await TemplateModel.findAll({
      where: {
        status: TemplateStatus.active
      }
    });
  }

  public async getTemplateDetails(ctx: MyContext): Promise<void> {
    ctx.body = await TemplateModel.findAll({
      where: {
        status: TemplateStatus.active,
      },
      attributes: ['id', 'name'],
      include: {
        model: TemplateGroupModel,
        attributes: ['id', 'templateId', 'text'],
        where: {
          status: TemplateGroupStatus.active
        },
        include: [{
          model: TemplateQuestionModel,
          attributes: ['id', 'groupId', 'text'],
          where: {
            status: TemplateQuestionStatus.active
          },
        }]
      }
    });
  }
}

export default new TemplateController;
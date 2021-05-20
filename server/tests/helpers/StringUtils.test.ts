import bcrypt from "bcrypt";
import StringUtils from "../../src/helpers/StringUtils";

describe('StringUtils.hashPassword', () => {
  it('should hash password and return string', async () => {
    const password = 'veryStrongPassword321';
    const hashed = await StringUtils.hashPassword(password);
    expect(hashed).toEqual(expect.any(String));
  });

  it('should hash two passwords and compare', async () => {
    const passwordOne = 'veryStrongPassword321';
    const passwordTwo = 'veryStrongPassword321';
    const passwordThree = 'somethingElse';
    const hashedOne = await StringUtils.hashPassword(passwordOne);
    const hashedTwo = await StringUtils.hashPassword(passwordTwo);
    const hashedThree = await StringUtils.hashPassword(passwordThree);
    expect(hashedOne).not.toBe(hashedTwo);
    expect(hashedOne).not.toBe(hashedThree);
    expect(hashedThree).not.toBe(hashedTwo);
  });
});

describe('StringUtils.hashCompare', () => {
  it('should compare hashed password with passed value', async () => {
    const password = 'veryStrongPassword321';
    const hashed = await StringUtils.hashPassword(password);
    const hashedAgain = await StringUtils.hashPassword(password);

    const isValid = await StringUtils.hashCompare(password, hashed);
    const isValidAgain = await StringUtils.hashCompare(password, hashedAgain);
    expect(isValid).toBeTruthy();
    expect(isValidAgain).toBeTruthy();
    // They are not the same
    expect(hashed).not.toBe(hashedAgain);
  });

  it('should reject', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
      throw new Error('ERROR:Rejected');
    });
    const password = 'veryStrongPassword321';
    await StringUtils.hashPassword(password).catch(error => {
      expect(error.message).toBe('ERROR:Rejected');
    });
  });
});

describe('StringUtils.randomChars', () => {
  it('should generate random chars', () => {
    const chars = StringUtils.randomChars(10);
    expect(chars).toEqual(expect.any(String));
    expect(chars).toHaveLength(10);
  });
});
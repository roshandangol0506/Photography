import ClientTeams from "../models/clientTeam.model";
import BcryptService from "./bcrypt.service";
import WebTokenServices from "./webtoken.service";
import mailService from "./mail.service";
import { DotenvConfig } from "../config/env.config";
import { Message } from "../constant/messages";
import HttpException from "../utils/HttpException.utils";
import { LoginDTO } from "../dto/login.dto";
import { VerifyOtpDTO } from "../dto/verifyOtp.dto";

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const toSafeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  twoFA: user.twoFA,
});

class authService {
  private bcrypt = new BcryptService();
  private tokenService = new WebTokenServices();
  private mail = new mailService();

  async login(body: LoginDTO) {
    try {
      const user = await ClientTeams.findOne({ email: body.email }).select(
        "+password +token +tokenCreatedAt",
      );
      if (!user) throw HttpException.unauthorized(Message.invalidCredentials);
      if (user.lock) throw HttpException.unauthorized(Message.accountLocked);

      const isMatch = await this.bcrypt.compare(body.password, user.password);
      if (!isMatch) {
        user.login_attempts = (user.login_attempts || 0) + 1;
        if (user.login_attempts >= DotenvConfig.MAX_LOGIN_ATTEMPTS) {
          user.lock = true;
          const unlockToken = this.tokenService.emailVerifyToken(user.id);
          await this.mail.send({
            to: user.email,
            subject: "Your admin account has been locked",
            html: `<p>Your account was locked after too many failed login attempts.</p><p>Unlock code: <b>${unlockToken}</b></p><p>Call <code>GET /api/auth/unlock/${unlockToken}</code> to unlock it. This code expires in ${Math.round(DotenvConfig.VERIFY_EMAIL_TOKEN_EXPIRES_IN / 60)} minutes.</p>`,
          });
        }
        await user.save();
        throw HttpException.unauthorized(Message.invalidCredentials);
      }

      user.login_attempts = 0;

      if (!user.twoFA) {
        await user.save();
        const token = this.tokenService.sign(user.id, user.role);
        return { otpRequired: false, token, user: toSafeUser(user) };
      }

      const otp = generateOtp();
      user.token = otp;
      user.tokenCreatedAt = new Date();
      user.otp_verified = false;
      await user.save();

      await this.mail.send({
        to: user.email,
        subject: "Your login OTP code",
        html: `<p>Your OTP code is <b>${otp}</b>. It expires in ${DotenvConfig.OTP_EXPIRY_MINUTES} minutes.</p>`,
      });

      return { otpRequired: true, email: user.email };
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(body: VerifyOtpDTO) {
    try {
      const user = await ClientTeams.findOne({ email: body.email }).select(
        "+token +tokenCreatedAt",
      );
      if (!user) throw HttpException.unauthorized(Message.invalidCredentials);
      if (user.lock) throw HttpException.unauthorized(Message.accountLocked);

      await user.clearTokenIfExpired();

      const isExpired =
        !user.tokenCreatedAt ||
        Date.now() - new Date(user.tokenCreatedAt).getTime() >
          DotenvConfig.OTP_EXPIRY_MINUTES * 60 * 1000;

      if (!user.token || isExpired || user.token !== body.otp) {
        throw HttpException.unauthorized(Message.invalidOtp);
      }

      user.otp_verified = true;
      user.token = null;
      user.tokenCreatedAt = null;
      await user.save();

      const token = this.tokenService.sign(user.id, user.role);
      return { token, user: toSafeUser(user) };
    } catch (error) {
      throw error;
    }
  }

  async unlock(token: string) {
    try {
      const payload = this.tokenService.verify(
        token,
        DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET,
      ) as unknown as { id: string };

      const user = await ClientTeams.findById(payload.id);
      if (!user) throw HttpException.notFound(Message.notFound);

      user.lock = false;
      user.login_attempts = 0;
      await user.save();

      return { id: user.id, email: user.email };
    } catch (error) {
      throw HttpException.unauthorized(Message.unAuthorized);
    }
  }

  async me(id: string) {
    try {
      const user = await ClientTeams.findById(id);
      if (!user) throw HttpException.notFound(Message.notFound);
      return toSafeUser(user);
    } catch (error) {
      throw error;
    }
  }
}

export default authService;

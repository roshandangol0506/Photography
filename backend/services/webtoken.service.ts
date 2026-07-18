import jwt from 'jsonwebtoken';
import { DotenvConfig } from '../config/env.config';

class WebTokenServices {
    sign(id: string, role?: string, organization_id?: string) {
    const payload: any = {
      id,
      role,
      organization_id: organization_id || null,
    };

    const token = jwt.sign(payload, DotenvConfig.JWT_SECRET as string, {
      expiresIn: DotenvConfig.JWT_TOKEN_EXPIRE as number,
    });

    return token;
  }

  verify(token: string, secret: string) {
    return jwt.verify(token, secret);
  }

  emailVerifyToken(id: string) {
    return jwt.sign(
      {
        id: id,
      },
      DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET,
      {
        // same expire time is used in both forgot password and reset-link whille register email
        expiresIn: DotenvConfig.VERIFY_EMAIL_TOKEN_EXPIRES_IN as number,
      }
    );
  }

  demoLinkToken(id: string, expiresIn: string) {
    return jwt.sign(
      {
        id: id,
      },
      DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET,
      {
        expiresIn: `${expiresIn}m` as unknown as number,
      }
    );
  }

  verifyDemoLinkToken(token: string) {
    return jwt.verify(token, DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET);
  }

  meetLinkToken(
  link: string,
  sender: string,
  expiresIn: string = '30d'
) {
  return jwt.sign(
    { link, sender },
    DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET,
    {
      expiresIn,
    } as jwt.SignOptions,
  );
}


  verifyMeetLinkToken(token: string) {
    return jwt.verify(token, DotenvConfig.VERIFY_EMAIL_TOKEN_SECRET);
  }
}

export default WebTokenServices;

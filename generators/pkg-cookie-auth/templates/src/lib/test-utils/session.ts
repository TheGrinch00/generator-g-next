import { IronSessionData, sealData, SessionOptions } from "iron-session";

export class CookieTestHandler {
  static async createSessionCookie<T extends IronSessionData>(
    session: IronSessionData,
    sessionOptions: SessionOptions,
  ): Promise<{
    cookie: string;
  }> {
    return {
      cookie: `${sessionOptions.cookieName}=${await sealData(
        session,
        sessionOptions,
      )}`,
    };
  }
}

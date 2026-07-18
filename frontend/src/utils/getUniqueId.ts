import { v1 as uuidv1 } from "uuid";
import { cookie } from "./cookie";
import { isUuid } from "./validator";
import { ClientJS } from "clientjs";

const cookieExpire = { days: 365 }; // example: 1 year

export async function getUniqueId(): Promise<string> {
  let uniqueID;
  const client = new ClientJS();
  const isCookie = client.isCookie();
  const existingUniqueID = cookie.getCookie("uniqueID");

  if (!existingUniqueID || !isUuid(existingUniqueID.split("_")[0])) {
    const uuid = uuidv1();
    const timestamp = Date.now();

    const newUniqueID = `${uuid}_${timestamp}`;
    uniqueID = newUniqueID;

    if (isCookie) {
      cookie.setCookie("uniqueID", newUniqueID, cookieExpire);
    }

    return uniqueID;
  }

  uniqueID = existingUniqueID;
  return uniqueID;
}

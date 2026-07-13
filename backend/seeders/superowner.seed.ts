import { ROLE } from "../constant/enum";
import ClientTeams from "../models/clientTeam.model";
import Auth from "../models/clientTeam.model";
import BcryptService from "../services/bcrypt.service";
import Print from "../utils/Print";

const superownerAccounts = [
  {
    name: "admin",
    email: "roshan@gmail.com",
    password: "Roshan@12345",
    role: ROLE.ADMIN,
    phone: "9841129468",
    otp_verified: true,
  },
];

const bcryptService = new BcryptService();
export async function superOwnerSeed() {
  try {
    await ClientTeams.deleteOne({ email: "superowner@palmmind.com" });
    for (let i = 0; i < superownerAccounts.length; i++) {
      const superowner = superownerAccounts[i];
      const check = await Auth.findOne({ email: superowner.email }, "email");
      if (check) {
        Print.info(check.email + "is already seeded");
        continue;
      }
      const hash = await bcryptService.hash(superowner.password);
      superowner.password = hash;
      await Auth.create(superowner);
      Print.info("Super owner seed successful" + superowner.email);
    }
  } catch (error: any) {
    Print.warn(error?.message);
  }
}

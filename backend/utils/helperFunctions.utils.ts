import ClientTeams from "../models/clientTeam.model";

const getUserRole = async (id: string) => {
  try {
    const user = await ClientTeams.findById(id);
    if (!user) {
      throw Error("User doesn not exist");
    }
    return user.role;
  } catch (error) {
    console.log(error);
  }
};

export { getUserRole };

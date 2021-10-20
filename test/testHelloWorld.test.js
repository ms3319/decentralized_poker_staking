const UserList = artifacts.require("UserList");

contract("UserList", (accounts) => {
  let userList;
  let expectedFirstUser;

  before(async () => {
    userList = await UserList.deployed();
  });

  describe("Adding to the users list and retrieving the users list", async () => {
    before("Add accounts[0] to the list of users", async () => {
      await userList.add({ from: accounts[0] });
      expectedFirstUser = accounts[0];
    });

    it("can fetch the first user in the list", async () => {
      const firstUser = await userList.users(0);
      assert.equal(
        firstUser,
        expectedFirstUser,
        "The first user in the list should be the first account."
      );
    });

    it("can fetch the entire user list", async () => {
      await userList.add({ from: accounts[1] });  
      const users = await userList.getUsers();
      assert.equal(
        users.length,
        2,
        "There should be two users in the list"
      );
      assert.equal(
        users[0],
        expectedFirstUser,
        "The first user in the list should be the first account"
      );
      assert.equal(
        users[1],
        accounts[1],
        "The second user in the list should be the second account"
      );
    });
  });
});

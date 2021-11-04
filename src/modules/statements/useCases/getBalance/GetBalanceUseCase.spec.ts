import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IGetBalanceDTO } from "./IGetBalanceDTO";

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Unit test", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  })
  describe("Get Balance UseCase", () => {
    it("Should not get statement balance if the user doesn't exist", async () => {
      expect(async () => {
        await getBalanceUseCase.execute({
          user_id: "123",
        });
      }).rejects.toBeInstanceOf(AppError);
    })

    it("Should make a deposit statement and a withdraw statement and return the correct balance", async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "JohnDoe@teest.com",
        password: "123456"
      };

      const newUser: User = await createUserUseCase.execute(user);

      const depositStatement: Statement = await createStatementUseCase.execute({
        user_id: newUser.id as string,
        type: OperationType.DEPOSIT,
        amount: 1500,
        description: "Making a deposit of U$ 1.000"
      });

      const withdrawStatement: Statement = await createStatementUseCase.execute({
        user_id: newUser.id as string,
        type: OperationType.WITHDRAW,
        amount: 1000,
        description: "Making a withdraw of U$ 999"
      });

      await statementsRepository.getUserBalance({ user_id: newUser.id } as IGetBalanceDTO).then((balance) => {
        expect(balance).toEqual({ "balance": 500 });
      });

    });
  });
})

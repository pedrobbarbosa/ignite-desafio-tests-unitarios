import { validate } from "uuid";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { IGetBalanceDTO } from "../getBalance/IGetBalanceDTO";



let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Unit test", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  describe("Create Statement Use Case", () => {
    it("Should create a statement", async () => {
      const user: User = await createUserUseCase.execute({
        name: "John Doe",
        email: "johnDoe@test.com",
        password: "123",
      });

      const statement: Statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 123,
        description: "Deposit"
      });

      expect(statement).toHaveProperty("id");
      expect(statement.user_id).toEqual(user.id);
      expect(validate(statement.id as string)).toBe(true);
      expect(validate(statement.user_id as string)).toBe(true);
      expect(statement.type).toEqual(OperationType.DEPOSIT);
    });

    it("Should make a deposit statement and then a withdraw statement correctly", async () => {
      const user: User = await createUserUseCase.execute({
        name: "Raphael Olifer",
        email: "raphaelOlifer@test.com",
        password: "123",
      });

      const depositStatement: Statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "Making a deposit of U$ 1.000"
      });

      const withdrawStatement: Statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 999,
        description: "Making a withdraw of U$ 999"
      });

      await statementsRepository.getUserBalance({ user_id: user.id } as IGetBalanceDTO).then((balance) => {
        expect(balance).toEqual({ "balance": 1 });
      });

      console.log(depositStatement);
      console.log(withdrawStatement);
    });

    it("Should not create a statement if the user doesn't exist", async () => {
      expect(async () => {
        const statement = await createStatementUseCase.execute({
          user_id: "1",
          type: OperationType.DEPOSIT,
          amount: 123,
          description: "Deposit"
        });
      }).rejects.toBeInstanceOf(AppError)

    })

    it("Should not create a statement if the amount is 0", async () => {
      expect(async () => {
        const user: User = await createUserUseCase.execute({
          name: "John Doe",
          email: "johnDoe@test.com",
          password: "123",
        });

        const statement: Statement = await createStatementUseCase.execute({
          user_id: user.id as string,
          type: OperationType.DEPOSIT,
          amount: 0,
          description: "Deposit"
        });
      }).rejects.toBeInstanceOf(AppError)
    });


    it("Should not create a statement if it's empty", async () => {
      expect(async () => {
        const user: User = await createUserUseCase.execute({
          name: "John Doe",
          email: "johnDoe@test.com",
          password: "123",
        });

        const statement: Statement = await createStatementUseCase.execute({
          user_id: "",
          type: "" as OperationType.DEPOSIT,
          amount: 0,
          description: ""
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not make a statement deposit if it's negative", async () => {
      expect(async () => {
        const user: User = await createUserUseCase.execute({
          name: "John Doe",
          email: "johnDoe@test.com",
          password: "123",
        });

        const statement: Statement = await createStatementUseCase.execute({
          user_id: user.id as string,
          type: OperationType.DEPOSIT,
          amount: -500,
          description: "Negative Deposit"
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not make a withdraw statement if the amount in the account isn't enough", async () => {
      expect(async () => {
        const user: User = await createUserUseCase.execute({
          name: "John Doe",
          email: "johnDoe@test.com",
          password: "123",
        });

        const statement: Statement = await createStatementUseCase.execute({
          user_id: user.id as string,
          type: OperationType.WITHDRAW,
          amount: 50000000,
          description: "Making a withdraw statement without enough amount"
        });
      }).rejects.toBeInstanceOf(AppError)
    });

  });
});

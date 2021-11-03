import { validate } from "uuid";
import { compare } from 'bcryptjs';

import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";
import { AppError } from "../../../../shared/errors/AppError";

let createUserUseCase: CreateUserUseCase;
let userRepository: InMemoryUsersRepository;


// RED / GREEN  / REFACTOR
describe("Create a user", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });
  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      password: "123456",
      email: "johndoe@teste.com"
    };
    const createdUser: User = await createUserUseCase.execute(user);

    const comparePassword = await compare(user.password, createdUser.password);

    const userKeys: string[] = Object.keys(user);

    userKeys.forEach(key => expect(createdUser).toHaveProperty(key));

    expect(createdUser).toHaveProperty("id");

    expect(validate(createdUser.id as string)).toBe(true);

    expect(comparePassword).toBe(true);
  });
  it("should not be able to create a user with the same email", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        password: "123456",
        email: "johnDoe@test.com"
      };
      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a user without password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "johnDoe@test.com",
        password: ""
      };
      await createUserUseCase.execute(user);

    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a user without name", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "",
        email: "johnDoe@test.com",
        password: "123456"
      };
      await createUserUseCase.execute(user);

    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a user without email", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "",
        password: "123456"
      };
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create a empty user", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "",
        email: "johnDoe@test.com",
        password: "123456"
      };
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError);
  });
});

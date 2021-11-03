import { verify } from "jsonwebtoken";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";


let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let userRepository: InMemoryUsersRepository;


interface JwtVerifyUserDTO {
  user: {
    id: string;
    email: string;
    name: string;
    password: string;
  },
  iat: number;
  exp: number;
  sub: string;
}


describe("Unit test", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
    createUserUseCase = new CreateUserUseCase(userRepository);
  });
  describe("Authenticate User UseCase", () => {
    it("Should authenticate an user", async () => {
      const user: ICreateUserDTO = {
        name: "John Doe",
        email: "johnDoe@teste.com",
        password: "123"
      };

      const userCreated: User = await createUserUseCase.execute(user);

      const authUser = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      const userCheckToken = verify(authUser.token, process.env.JWT_SECRET as string) as JwtVerifyUserDTO

      expect(authUser).toHaveProperty("token");
      expect(userCheckToken).toBeTruthy();
      expect(userCheckToken.user.id).toEqual(userCreated.id);
    });

    it("Should not authenticate an user that was not created", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "John Doe",
          email: "johnDoe@teste.com",
          password: "123"
        };

        const response = await authenticateUserUseCase.execute(user);

      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not authenticate an user with incorrect email", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "John Doe",
          email: "johnDoe@teste.com",
          password: "123"
        };

        const userCreated: User = await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
          email: "this isn't john doe",
          password: user.password
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not authenticate an user with incorrect password", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "John Doe",
          email: "johnDoe@teste.com",
          password: "123"
        };

        const userCreated: User = await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
          email: user.name,
          password: "this isn't the password"
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not authenticate an empty user", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "",
          email: "",
          password: ""
        };

        const userCreated: User = await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
          email: user.name,
          password: "this isn't the password"
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not authenticate an user without email", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "John Doe",
          email: "",
          password: "123456"
        };

        const userCreated: User = await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
          email: user.name,
          password: "this isn't the password"
        });
      }).rejects.toBeInstanceOf(AppError)
    });

    it("Should not authenticate an user without password", async () => {
      expect(async () => {
        const user: ICreateUserDTO = {
          name: "John Doe",
          email: "johnDoe@email.com",
          password: ""
        };

        const userCreated: User = await createUserUseCase.execute(user);

        const authUser = await authenticateUserUseCase.execute({
          email: user.name,
          password: "this isn't the password"
        });
      }).rejects.toBeInstanceOf(AppError)
    });
  })
});

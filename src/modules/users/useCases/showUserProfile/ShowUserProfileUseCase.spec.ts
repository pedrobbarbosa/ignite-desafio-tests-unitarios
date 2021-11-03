import { verify, } from "jsonwebtoken";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
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
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);
  });

  it("Should show user profile ", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      password: "123456",
      email: "johnDoe@teste.com"
    };

    const createdUser: User = await createUserUseCase.execute(user);
    const userJsonReturnedFromUseCase: string[] = Object.keys(createdUser);

    const authUser: IAuthenticateUserResponseDTO = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const userProfile = await showUserProfileUseCase.execute(createdUser.id as string)
    const userCheckToken = verify(authUser.token, process.env.JWT_SECRET as string) as JwtVerifyUserDTO

    userJsonReturnedFromUseCase.forEach(key => expect(userProfile).toHaveProperty(key));
    expect(authUser).toHaveProperty("token");
    expect(userCheckToken).toBeTruthy();
    expect(userCheckToken.user.id).toEqual(createdUser.id);
  })

  it("Should not show a user profile that not exists", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1")
    }).rejects.toBeInstanceOf(AppError)
  });


})

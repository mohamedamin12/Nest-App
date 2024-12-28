import { SetMetadata } from "@nestjs/common";
import { UserType } from '../../utils/enum';


export const Roles = (...roles : UserType[] ) => SetMetadata('roles', roles)
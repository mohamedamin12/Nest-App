import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JwtPayloadType } from 'src/utils/types';


export const GetMeUser = createParamDecorator(
  (data , context : ExecutionContext)=> {
    const req = context.switchToHttp().getRequest();
    const payload : JwtPayloadType = req[CURRENT_USER_KEY];
    return payload;
  }
)
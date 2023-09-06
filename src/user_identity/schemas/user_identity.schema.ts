import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserIdentity {

  id:string;

  @Prop({ required: true })
  email: string;

  @Prop({ })
  openai_api_key: string;

}

export const UserIdentitySchema = SchemaFactory.createForClass(UserIdentity);

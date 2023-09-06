import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class Prompt {

  id:string;

  @Prop({ required: true })
  title: string;

  @Prop({ })
  content: string;

}

export const PromptSchema = SchemaFactory.createForClass(Prompt);


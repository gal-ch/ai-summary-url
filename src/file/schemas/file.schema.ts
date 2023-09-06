import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class File {

  id:string;

  @Prop({ required: true })
  name: string;


  @Prop({ })
  file_size: number[];

  @Prop({})
  content: any[];

  @Prop({ type: Date})
  chunk_size: number;

}

export const CitySchema = SchemaFactory.createForClass(File);


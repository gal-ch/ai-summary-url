import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { OpenaiService } from 'src/openai/openai.service';

@Module({
  providers: [PromptService, OpenaiService]
})
export class PromptModule {}

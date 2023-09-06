import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { PromptService } from 'src/prompt/prompt.service';

@Module({
    providers: [PromptService, OpenaiService]
})
export class OpenaiModule {

}
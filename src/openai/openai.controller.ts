import { Controller, Get } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { log } from 'console';

@Controller('openai')
export class OpenaiController {



    constructor(private readonly openaiService: OpenaiService) {}


    @Get('')
    async askQuestion() {
      // const [query, url] = res
      // openaiService


    }

}

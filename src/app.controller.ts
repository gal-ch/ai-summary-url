import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { UrlService } from './url/url.service';

@Controller()
export class AppController {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly urlService: UrlService,
  ) {}

  @Post()
  async askQuestion(@Body('question') question:string,@Body('url') url:string,  @Res() res) {
    try {
        const data = await this.urlService.processData(url)
        const processedString = this.urlService.processStringByTokens(data)
        const embeddeData = await this.openaiService.embeddingAsChuncks(processedString)
        const response = await this.openaiService.ask(question,embeddeData)
        console.log(response);
        res.status(200).json({message: response});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

}

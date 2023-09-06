import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromptModule } from './prompt/prompt.module';
import { UserIdentityModule } from './user_identity/user_identity.module';
import { UrlService } from './url/url.service';
import { FileService } from './file/file.service';
import { FileModule } from './file/file.module';
import { OpenaiService } from './openai/openai.service';
import { OpenaiController } from './openai/openai.controller';
import { OpenaiModule } from './openai/openai.module';
import { PromptService } from './prompt/prompt.service';


@Module({
  imports: [PromptModule, UserIdentityModule, FileModule, OpenaiModule],
  controllers: [AppController, OpenaiController],
  providers: [AppService, UrlService, FileService, OpenaiService, PromptService],
})
export class AppModule {}

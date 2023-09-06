import { Injectable } from '@nestjs/common';
import { DEFAULT_PROMPT, GPT_MODEL } from 'src/constants';
import tiktoken from 'tiktoken-node';


@Injectable()
export class PromptService {
    constructor() {}

    numOfTokens(text: string):number{
        const encoding = tiktoken.encodingForModel(GPT_MODEL)
        return encoding.encode(text).length
    }

    /**
     * @param query the question to be asked
     * @param tokenBudget 
     * @param strings the assoited data
     * @returns a message for GPT, with relevant source texts pulled from a dataframe.
     */
    async queryMessage(query: string, tokenBudget: number, strings: string[] | number[]):Promise<string>{
      const introduction = DEFAULT_PROMPT
      const question = `Question: ${query}`
      let message = introduction
      for(const string of strings){
          const nextSection = `document section:\n"${string}`
          message += nextSection
      }
      return message + question
    }

}
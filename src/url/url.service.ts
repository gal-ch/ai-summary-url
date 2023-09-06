import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { number } from 'mathjs';
import { GPT_MODEL } from 'src/constants';
const tiktoken = require('tiktoken-node')


@Injectable()
export class UrlService {
    constructor() {}

    async getUrlData(url: string) {
        try {
          const response = await axios.get(url);
          const html = response.data;
          const $ = cheerio.load(html);
          return $;
        } catch (error) {
          console.error(error);
          throw error;
        }
    }
/**
 * iterates over URL Content to identify relevant text
 * @param url the relevant url
 * @returns An array containing an array of title and its content.
 */
    async processData(url: string): Promise<[string, string][]> {
        try {
          const $ = await this.getUrlData(url);
          const titlesToScrape = ['h1', 'h2'];
          const data: [string, string][] = [];
          titlesToScrape.forEach((titleTag) => {
            $(titleTag).each((index, element) => {
              const titleText = $(element).text();
              let associatedText = '';
              let nextElement = $(element).next();
              while (nextElement.length && !titlesToScrape.includes(nextElement.get(0).tagName.toLowerCase())) {
                associatedText += nextElement.text();
                nextElement = nextElement.next();
              }
              data.push([titleText, associatedText]);
            });
          });
          return data;
        } catch (error) {
          console.error(error);
          throw error; 
        }
      }
    
    numOfTokens(text: string):number{
        const encoding = tiktoken.encodingForModel(GPT_MODEL)
        return encoding.encode(text).length
    }

/**
 * Split a string in two according to a specific character
 * @param inputString the string we want to devied
 * @param devivder the character to deveied on
 * @returns an array of the split string divided into two
 */
    divideByDelimiter(inputString: string, delimiter: string = "\n"):[string, string]{
        const chunks = inputString.split(delimiter)
        if(chunks.length == 1){
            return [inputString, ""]
        }
        else{
            const totalTokens = this.numOfTokens(inputString)
            const middle = totalTokens / 2
            let bestDiff = middle
            for (var i = 0; i < chunks.length; i++){
                let left = chunks.slice(0,number(i+1)).join(delimiter)
                const leftTokens = this.numOfTokens(left)
                const diff = Math.abs(middle - leftTokens)
                if (diff >= bestDiff){
                    break
                }  
                else{
                    bestDiff = diff
                }
            }
            const left = chunks.slice(0,i).join(delimiter)
            const right = chunks.slice(i).join(delimiter)
            return [left, right]
        }
    }

    truncatedString(string: string, model: string = GPT_MODEL ,maxTokens: number){
        const encoding = tiktoken.encodingForModel(model);
        const encodedString = encoding.encode(string)
        const truncatedString = encoding.decode(encodedString.slice(0, maxTokens));
        return truncatedString
    }


/**
 * dfs for spliting a string into smaller strings based on delimiters
 * @param subsection an array continig a title and it content
 * @param maxTokens 
 * @param model
 * @param aׁttempts
 * @returns an array with th splitited strings
 */
    splitStringsFromSubsection(subsection: [string, string], maxTokens: number = 1000, model: string = GPT_MODEL, attempts: number = 5): string[] {
        const stack: [string, string, number][] = [[subsection[0], subsection[1], attempts]];
        const results: string[] = [];
        while (stack.length > 0) {
            const [title, text, remainingAׁttempts] = stack.pop();
            let string = (title + "\n\n" + text).replace(/[\x00-\x1F]/g, '');
            const numTokensInString = this.numOfTokens(string);
            if (numTokensInString <= maxTokens) {
                results.push(string);
            } else if (remainingAׁttempts > 0) {
                for (const delimiter of ["\n\n", "\n", ". "]) {
                    const [left, right] = this.divideByDelimiter(text, delimiter);
                    if (left !== "" && right !== "") {
                        stack.push([title, left, remainingAׁttempts - 1]);
                        stack.push([title, right, remainingAׁttempts - 1]);
                    }      
                }
            }else  {
                results.push(this.truncatedString(string, model = model, maxTokens = maxTokens));
            }
        }
        return results;
    }

    processStringByTokens(dataToProcess:[string, string][]){
        let processedString:string[] = []
        for(const section of dataToProcess){
            processedString = processedString.concat(this.splitStringsFromSubsection(section))

        }
        return processedString
    }
}


import { Injectable } from '@nestjs/common';
import OpenAIApi from "openai";
import { DataFrame } from "danfojs-node";
import { PromptService } from 'src/prompt/prompt.service';
import { GPT_MODEL, EMBEDDING_MODEL, DEFAULT_SYSTEM_ROLE  } from '../constants';
const distance = require('compute-cosine-distance')



@Injectable()
export class OpenaiService {
    private readonly openaiInstance: OpenAIApi;
    private queryEmbedding = null;
    private relatedSlice = 100
    constructor(private readonly promptService: PromptService) {
        this.openaiInstance = new OpenAIApi({apiKey: process.env.OPENAI_API_KEY});
    }

    async embdding(inputText:string[]|string, model:string = EMBEDDING_MODEL){  
        try {
            const result = await this.openaiInstance.embeddings.create({
                model: model,
                input: inputText,
            });
            return result;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

/**
 * @param stringsForEmbdding the contents of the URL are distributed within a string array.
 * @param batchSize the size of the string to send to the embdding end point
 * @returns a data frame with two columns: the devivded content and it embedding
 */
    async embeddingAsChuncks(stringsForEmbdding:string[], batchSize:number = 1000):Promise<DataFrame>{
        let embeddings = []
        for(let i=0; i<stringsForEmbdding.length;i += batchSize){
            const batchEnd = i + batchSize;
            const batch = stringsForEmbdding.slice(i, batchEnd);
            const response = await this.embdding(batch)
            const batch_embeddings = response["data"].map( e => e["embedding"])
           embeddings = embeddings.concat(batch_embeddings)
        } 
        return new DataFrame({"text": stringsForEmbdding, "embedding": embeddings})
    }


    calculateCosineSimilarity(row):[string, number] {
        const y = row[1]
        const maxLength = Math.max(this.queryEmbedding.length, y.length);
        const paddedX= [...this.queryEmbedding, ...Array(maxLength - this.queryEmbedding.length).fill(0)];
        const paddedY = [...y, ...Array(maxLength - y.length).fill(0)];
        const similarity = distance( paddedX, paddedY );
        const dissimilarity = 1 - similarity;
        return [row[0], dissimilarity];
    }
  
/**
 * 
 * @param query the question from the user
 * @param df the embedd content from the url
 * @param relatedSlice the top string from the relevent array
 * @returns an array with 2 array: the top relatedSlice contents and their corspending relatednesses
 */
    async orderDocumentSectionsByQuerySimilarity(query: string, df:DataFrame, relatedSlice:number = this.relatedSlice){
        const queryEmbedding = await this.embdding(query, EMBEDDING_MODEL);        
        this.queryEmbedding = queryEmbedding['data'][0].embedding
        let stringsAndRelatednesses:[string, number][] = []
        for(let row of df.values){
            let textRelatednesses = this.calculateCosineSimilarity(row)
            stringsAndRelatednesses.push(textRelatednesses)
        }  
        stringsAndRelatednesses.sort((a, b) => b[1] - a[1])
        let strings:string[] = []
        let relatednesses:number[] = []
        for(let item of  stringsAndRelatednesses){
            strings.push(item[0])
            relatednesses.push(item[1])
        }
        return [strings.slice(0, relatedSlice), relatednesses.slice(0, relatedSlice)]
    }


/**
 * Answers a query using GPT and a dataframe of relevant texts and embeddings.
 * @param query the question to be ask
 * @param df the emddedd data
 * @param model the name of the model to send the question to
 * @param tokenBudget 
 * @param printMessage 
 * @returns the answer to the question 
 */
    async ask(query: string, df, model: string = GPT_MODEL, tokenBudget: number = 4096 - 500):Promise<string>{
        try{
            let [strings, relatednesses] = await this.orderDocumentSectionsByQuerySimilarity(query, df)
            console.log("=====query similarity======");
            console.log([strings, relatednesses]);
            const message = await this.promptService.queryMessage(query, tokenBudget=tokenBudget, strings)
            const response = await this.openaiInstance.chat.completions.create({
                messages: [{"role": "system", "content": DEFAULT_SYSTEM_ROLE},
                {"role": "user", "content": message}],
                model:model,
                temperature:0
            })
            return response["choices"][0]["message"]["content"]
        }catch (error) {
            console.error(error);
            return "An error occurred; cannot obtain the relevant information";
        }

    }

}

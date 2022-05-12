import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Article } from "src/entities/article.entity";
import { Repository } from "typeorm";

@Injectable()

export class ArticleService extends TypeOrmCrudService<Article>{
    constructor(
        @InjectRepository(Article)
        private readonly article: Repository<Article>// cim pomenemo Repository moramo da ga evidentiramo u app.module
    ){
        super(article);
    }
}
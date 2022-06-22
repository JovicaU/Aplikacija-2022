import * as Validator from 'class-validator';
import { ArticleFeatureComponentDto } from './article.feature.component.dto';

export class AddArticleDto{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5, 128)  
    name: string;

    categoryId: number;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 128)
    excerpt: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(64, 10000)  
    description: string;

    @Validator.IsNotEmpty()
    @Validator.IsNumber({
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 2,
    })
    @Validator.IsPositive()
    price: number;

    @Validator.IsArray()
    @Validator.ValidateNested({
        always: true
    })
    features: ArticleFeatureComponentDto[]; 


}

/*
"name": "ACME SSD HD 1TB",
"categoryId": 5,
"excerpt": "Kartak opis proizvoda",
"description": "Detaljan opis proizvoda",
"price": 56.78,
"features": [
    {"featureId": 1, "value": "1TB"},
    {"featureId": 3, "value": "SSD"}
]
 */



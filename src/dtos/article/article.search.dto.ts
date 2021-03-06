import * as Validator from 'class-validator';
import { ArticleSearchFeatureComponentDto } from './article.search.feature.component.dto';


export class  ArticleSearchDto{

    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    categoryId: number;


    @Validator.IsOptional()
    @Validator.IsString()
    @Validator.Length(2, 128)
    keywords: string;


    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    @Validator.IsPositive()
    priceMin: number;

    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    @Validator.IsPositive()
    priceMax: number;

    features: ArticleSearchFeatureComponentDto[];

    @Validator.IsOptional()
    @Validator.IsIn(['name', 'price'])
    orderBy: 'name' | 'price';

    @Validator.IsOptional()
    @Validator.IsIn(['ASC', 'DESC'])
    orderDirection: 'ASC' | 'DESC';

    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    @Validator.IsPositive()
    page: number;

    @Validator.IsOptional()
    @Validator.IsIn([5, 10, 25, 50, 75])
    itemsPerPage: 5 | 10 | 25 | 50 | 75;

}
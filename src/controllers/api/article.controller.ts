import { Body, Controller, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { StorageConfig } from "config/storage.config";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";
import {diskStorage} from "multer";
import { fileName } from "typeorm-model-generator/dist/src/NamingStrategy";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";
//import * as fileType from 'file-type';
import filetype from 'magic-bytes.js'

import * as fs from 'fs';
import * as sharp from 'sharp';
import { readFileSync } from "fs";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    }, 
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            photos: {
                eager: true
            },
            articlePrices: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            features: {
                eager: true
            },
        }
    }
})
export class ArticleController{
   
    constructor (
        public service: ArticleService,
        public photoService: PhotoService,
        ){}
@Post('createFull') // POST http://localhost:3000/api/article/createFull/
    createFullArticle(@Body() data: AddArticleDto){
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto/') // POST http://localhost:3000/api/article/:id/uploadPhoto/
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photosDestination,
                filename:(req, file, callback) => {

                    let original: string = file.originalname;

                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '');
                    let sada = new Date();
                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth()+1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string = new Array(10) 
                    .fill(0)
                    .map(e => (Math.random()*9).toFixed(0).toString())
                    .join('');

                    let fileName = datePart + '-' + randomPart + '-' + normalized;

                    callback(null, fileName);

                    
                }
            }),
            fileFilter:(req, file, callback) => {

                //Check ekstenzije: jpg, png

                if (!file.originalname.match(/\.(jpg|png)$/)){ 
                    req.fileFilterError = 'Bad file extension! ';
                    callback(null, false);
                    return;
                }

                //Check tipa sadrzaja: image/jpeg, image/png (mimetype)

                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))){
                    req.fileFilterError = 'Bad file content type ! ';
                    callback(null, false);

                    return;
                
                }
                callback(null, true);
            },
            limits: {
                files: 1,
                fileSize : StorageConfig.photoMaxFileSize,
            }
        })
    )
    async uploadPhoto(
        @Param('id') articleId: number, 
        @UploadedFile() photo,
        @Req() req
        ): Promise< Photo| ApiResponse>{
            if(req.fileFilterError){
                return new ApiResponse('error', -4002, req.fileFilterError); 
            }
            if(!photo){
                return new ApiResponse('error', -4002, 'File not uploaded! '); 
            }
            const type = filetype(readFileSync(photo.path))[0]?.typename;
            //const fileType = await import('file-type');
           // const fileTypeResult = await type.fileTypeFromFile(photo.path); // provjeriti dokumentaciju za ovu funkciju fileTypeFromFile mozda je samofrom file
          
            if(!type){
               fs.unlinkSync(photo.path); // TODO: Obrisati taj fajl
                return new ApiResponse('error', -4002, 'Cannot detect file type! '); 
            }
            //  TODO: Real mime type check.

            const realMimeType = type;
            if (!(realMimeType.includes('jpg') || realMimeType.includes('png'))){
                // TODO: Obrisati taj fajl
                return new ApiResponse('error', -4002, 'Bad file content type ! '); 
            }
          //  TODO: Save a resized file.
          await this.createThumb(photo);
          await this.createSmallImage(photo);

          
        const newPhoto: Photo = new  Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if(!savedPhoto){
            return new ApiResponse('error', -4001); 
        }
        return savedPhoto;
    }

    async createThumb(photo){
        const orginalFilePath = photo.path;
        const fileName = photo.name;
        const type = filetype(readFileSync(photo.path))[0]?.typename;


        const destinationFilePath = StorageConfig.photosDestination + "thumb/" + fileName + "." + type;

        await sharp(orginalFilePath).resize({
            fit: 'cover',
            width: StorageConfig.photoThumbSize.width,
            height: StorageConfig.photoThumbSize.height

        }).toFile(destinationFilePath);

    }
        
    async createSmallImage(photo){
       // let fileType = await import('file-type');

       // const fileTypeResult = await fileType.fileTypeFromFile(photo.path);
        const orginalFilePath = photo.path;
        const fileName = photo.name;
        //const realMimeType = fileTypeResult.mime;
        const type = filetype(readFileSync(photo.path))[0]?.typename;

        const destinationFilePath = StorageConfig.photosDestination + "small/" + fileName + "." + type ;

        await sharp(orginalFilePath).resize({
            fit: 'cover',
            width: StorageConfig.photoSmallSize.width,
            height: StorageConfig.photoSmallSize.height,
          //  mimeType: realMimeType

        }).toFile(destinationFilePath);

    }



}
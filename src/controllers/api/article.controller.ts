import { Body, Controller, Delete, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
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
import { EditArticleDto } from "src/dtos/article/edit.article.dto";

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
            }
        }
    },
    routes:{
        exclude:['updateOneBase', 'updateOneBase', 'deleteOneBase'],
    },
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

    @Patch(':id') // PATCH http://localhost:3000/api/article/2/
    editFullArticle(@Param('id') id:number, @Body() data: EditArticleDto){
        return this.service.editFullArticle(id, data);
    }
    

    @Post(':id/uploadPhoto/') // POST http://localhost:3000/api/article/:id/uploadPhoto/
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
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
                fileSize : StorageConfig.photo.maxSize,
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
          await this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
          await this.createResizedImage(photo, StorageConfig.photo.resize.small);

          
        const newPhoto: Photo = new  Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if(!savedPhoto){
            return new ApiResponse('error', -4001); 
        }
        return savedPhoto;
    }

async createResizedImage(photo, resizeSettings){

       const orginalFilePath = photo.path;
       const fileName = photo.name;
       const type = filetype(readFileSync(photo.path))[0]?.typename;

       const destinationFilePath = StorageConfig.photo.destination + resizeSettings.directory + fileName + "." + type ;

       await sharp(orginalFilePath).resize({
           fit: 'cover',
           width: resizeSettings.width,
           height: resizeSettings.height,

       }).toFile(destinationFilePath);

}
// http://localhost:3000/api/article/1/deletePhoto/45/
@Delete(':articleId/deletePhoto/:photoId')
public async deletePhoto(
    @Param('articleId') articleId: number,
    @Param('photoId') photoId: number,
    ){
        const photo = await this.photoService.findOne({where:{
             articleId: articleId,
             photoId: photoId
        }});

        if(!photo){
            return new ApiResponse('error', -4004, 'Photo not found!');
        }
     try{
        fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
        fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.thumb.directory+ photo.imagePath);
        fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.small.directory+ photo.imagePath);
     }catch(e){}
         const deleteResult = await this.photoService.deleteById(photoId);

         if(deleteResult.affected === 0 ){
            return new ApiResponse('error', -4004, 'Photo not found!');
         }
         return new ApiResponse('ok', 0, 'One photo deleted! ');

    }


}
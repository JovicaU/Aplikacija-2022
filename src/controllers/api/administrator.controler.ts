import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { Administrator } from "src/entities/administrator.entity";
import { AdministratorService } from "src/services/administrator/administrator.service";

@Controller('api/daministrator')
export class AdministratorController{
    constructor(
        private administratorService: AdministratorService
      ){}
     

      //GET http://localhost:3000/api/administrator/
      @Get()
getAll(): Promise<Administrator[]> {
        return this.administratorService.getAll();
        
  }

        //GET http://localhost:3000/api/administrator/4/
  @Get( ':id')
  getById(@Param('id') administratorId: number): Promise<Administrator> {
          return this.administratorService.getById(administratorId);
          
    }
      //GET http://localhost:3000/api/administrator/
    @Put()
    add(@Body() data: AddAdministratorDto): Promise<Administrator>  {
        return this.administratorService.add(data);

}

      //POST http://localhost:3000/api/administrator/4/
      @Post(':id')
      edit(@Param('id') id: number, @Body()  data: EditAdministratorDto):  Promise<Administrator>{
            return this.administratorService.editById(id, data);
          
      }

}
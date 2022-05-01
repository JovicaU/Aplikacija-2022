import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entities/administrator.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) 
        private readonly administrator: Repository<Administrator>,
    ){}

    getAll(): Promise<Administrator[]> {
        return this.administrator.find();
    }

    getById(id: unknown): Promise<Administrator> { //ne znamo da li je ovdje ispravno unknown prvobitno number

        return this.administrator.findOne(id);

    }
}

export class LoginInfoDto {
    id: number;
    identity: string;
    token: string;
    refreshToken: string;
    refreshTokenExpiresTAt: string;

    constructor (id: number, identity: string, jwt: string, refreshToken:string, refreshTokenExpiresTAt:string ){
        this.id = id;
        this.identity = identity;
        this.token = jwt;
        this.refreshToken = refreshToken;
        this.refreshTokenExpiresTAt = refreshToken


    }
}
export const StorageConfig = {
  /*  photosDestination : '../storage/photos/',
    photoMaxFileSize : 1024 * 1024 * 3, // ubajtovima
    photoThumbSize: {width: 120 , height: 100 },
    photoSmallSize: {width: 320 , height: 240 },*/

    photo: {
        destination:'../storage/photos/',
        urlPrefix: '/assets/photos/',
        maxAge: 1000*60*60*7,

        maxSize: 3*1024*1024, // 3MB u bajtovima
        resize: {
            thumb: {
                width: 120 ,
                height: 100,
                directory: 'thumb/'
            },
            small: {
                width: 320 ,
                height: 240,
                directory: 'small/'
            },
        },
    },

};
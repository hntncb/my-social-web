import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info:{
            title: "Post API"
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },

    },
    apis: ["./src/features/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
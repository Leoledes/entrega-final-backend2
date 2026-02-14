import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userModel from '../dao/models/userModel.js';
import config from './envConfig.js';
import { createUserDTO } from '../dto/userDTO.js';

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    }
    
    return token;
};

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    
    secretOrKey: config.jwt.secret
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await userModel.findById(jwt_payload.userId);
        
        if (!user) {
            return done(null, false);
        }
        
        return done(null, user);
        
    } catch (error) {
        return done(error, false);
    }
}));

passport.use('current', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await userModel.findById(jwt_payload.userId).populate('cart');
        
        if (!user) {
            return done(null, false);
        }
        
        const userDTO = createUserDTO(user);
        
        return done(null, userDTO);
        
    } catch (error) {
        return done(error, false);
    }
}));

export default passport;
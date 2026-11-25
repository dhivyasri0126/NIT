import { UserRepository } from '../repositories/userRepository.js';
import { hashPassword, comparePassword } from '../utils/passwordHelper.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenHelper.js';

export class AuthService {
  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password credentials' };
    }

    if (user.status !== 'ACTIVE') {
      throw { statusCode: 403, message: 'User account has been deactivated or suspended' };
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password credentials' };
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role_code,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await UserRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role_code,
        roleName: user.role_name,
      },
      accessToken,
      refreshToken,
    };
  }

  static async register(data) {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) {
      throw { statusCode: 409, message: 'A user with this email address already exists' };
    }

    const passwordHash = await hashPassword(data.password);
    const userId = `USR-${Date.now().toString().slice(-6)}`;

    const newUser = await UserRepository.create({
      id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
    });

    await UserRepository.assignRole(newUser.id, data.roleId || 2); // Default Salesman
    const fullUser = await UserRepository.findById(newUser.id);

    return fullUser;
  }

  static async refreshToken(oldRefreshToken) {
    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      throw { statusCode: 401, message: 'Refresh token expired or invalid' };
    }

    const tokenRecord = await UserRepository.findRefreshToken(oldRefreshToken);
    if (!tokenRecord) {
      throw { statusCode: 401, message: 'Refresh token revoked or not recognized' };
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw { statusCode: 401, message: 'User associated with token no longer active' };
    }

    await UserRepository.revokeRefreshToken(oldRefreshToken);

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role_code,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserRepository.saveRefreshToken(user.id, newRefreshToken, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    const fullUser = await UserRepository.findByEmail(user.email);

    const isMatch = await comparePassword(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Current password provided is incorrect' };
    }

    const newHash = await hashPassword(newPassword);
    await UserRepository.updatePassword(userId, newHash);
    await UserRepository.revokeAllUserTokens(userId);

    return { message: 'Password updated successfully' };
  }
}

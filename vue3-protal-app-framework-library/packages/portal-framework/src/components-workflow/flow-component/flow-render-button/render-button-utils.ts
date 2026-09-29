import { map } from "lodash";

/**
 * 格式化用户信息
 * @param {any[]} members
 * @returns {any}
 */
export function formatUser(members: any[]) {
  return map(members, user => {
    if (user.userId) {
      user.id = user.userId;
    }
    if (user.userName) {
      user.name = user.userName;
    }
    return user;
  });
}

class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.fullName = `${user.first_name} ${user.last_name}`;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart;
    }
}

export const createUserDTO = (user) => {
    if (!user) return null;
    return new UserDTO(user);
};

export const createUserDTOArray = (users) => {
    if (!users || !Array.isArray(users)) return [];
    return users.map(user => new UserDTO(user));
};

export default UserDTO;
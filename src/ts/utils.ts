export const log = (...args: any[]) => {
    console.log(
        `%c PlayTime %c`,
        'background: #16a085; color: black;',
        'background: #1abc9c; color: black;',
        ...args,
    );
};

export const debug = (...args: any[]) => {
    console.debug(
        `%c PlayTime %c`,
        'background: #16a085; color: black;',
        'background: #1abc9c; color: black;',
        'color: blue;',
        ...args,
    );
};

export const error = (...args: any[]) => {
    console.error(
        `%c PlayTime %c`,
        'background: #16a085; color: black;',
        'background: #FF0000;',
        ...args,
    );
};

let logger = {
    info: (...args: any[]) => {
        log(...args);
    },

    debug: (...args: any[]) => {
        debug(...args);
    },

    error: (...args: any[]) => {
        error(...args);
    }
}

export default logger;
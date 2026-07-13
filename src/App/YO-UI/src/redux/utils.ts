export function objectToFormData(obj: any, form = new FormData(), namespace = "") {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];
        const formKey = namespace ? `${namespace}[${key}]` : key;

        if (value instanceof Date) {
            form.append(formKey, value.toISOString());
        } else if (value instanceof File) {
            form.append(formKey, value);
        } else if (Array.isArray(value)) {
            value.forEach((el, i) => {
                const arrayKey = `${formKey}[${i}]`;
                if (el instanceof File) {
                    form.append(arrayKey, el);
                } else if (typeof el === "object") {
                    objectToFormData(el, form, arrayKey);
                } else {
                    form.append(arrayKey, el);
                }
            });
        } else if (typeof value === "object" && value !== null) {
            objectToFormData(value, form, formKey); // recursive for nested objects
        } else if (value !== undefined && value !== null) {
            form.append(formKey, value);
        }
    }
    return form;
}

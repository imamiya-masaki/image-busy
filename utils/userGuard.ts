import { Post, Image } from '@prisma/client';


type ParentElement = Element & {
    children: HTMLCollection
}

export function isPost (value: any): value is Post {
    if (!value) {
        return false
    }
    if (typeof value.title != "string") {
        return false
    }
    if (typeof value.id != "number") {
        return false
    }
    if (!(typeof value.createdAt == "object" && Object.prototype.toString.call(value.createdAt) == "[object Date]")) {
        return false
    }
    if (!(typeof value.createdAt == "object" && Object.prototype.toString.call(value.updatedAt) == "[object Date]")) {
        return false
    }

    return true    
}

export function isImage (value: any): value is Image {
    if (!value) {
        return false
    }
    if (typeof value.postId != "number" ) {
        return false 
    }
    if (typeof value.id != "number" ) {
        return false 
    }
    if (typeof value.uri != "string" ) {
        return false 
    }

    return true    
}

export function isElement (value: any): value is Element {
    if (!value) {
        return false
    }
    if (!value.baseURI) {
        return false
    }
    if (!value.localName) {
        return false
    }
    if (!value.nodeName) {
        return false
    }
    return true
}

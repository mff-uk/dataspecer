import { CreateLdkitInstanceGenerator, CreateLdkitInstanceTemplate } from "./create-instance-generator";
import { InstanceDeleteLdkitGenerator, InstanceDeleteLdkitTemplate } from "./instance-delete-generator";
import { InstanceDetailLdkitReaderGenerator, InstanceDetailLdkitReaderTemplate } from "./instance-detail-reader-generator";
import { InstanceListLdkitReaderGenerator, InstanceListLdkitReaderTemplate } from "./instance-list-reader-generator";
import { EditLdkitInstanceGenerator, EditLdkitInstanceTemplate } from "./edit-instance-generator";

export {
    CreateLdkitInstanceGenerator,
    InstanceDeleteLdkitGenerator,
    InstanceDetailLdkitReaderGenerator,
    InstanceListLdkitReaderGenerator,
    EditLdkitInstanceGenerator,

    CreateLdkitInstanceTemplate as CreateTemplate,
    InstanceDeleteLdkitTemplate as DeleteTemplate,
    InstanceDetailLdkitReaderTemplate as DetailTemplate,
    InstanceListLdkitReaderTemplate as ListTemplate,
    EditLdkitInstanceTemplate as EditTemplate
}
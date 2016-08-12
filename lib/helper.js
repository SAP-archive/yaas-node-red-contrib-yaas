function tenantId(yaasCredentials) {
    if (yaasCredentials
        && yaasCredentials.application_id
        && typeof yaasCredentials.application_id == "string") {
        return yaasCredentials.application_id.split('.')[0];
    }
}
exports.tenantId = tenantId;
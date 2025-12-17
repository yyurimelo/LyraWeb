export type PaginationDataModel<T> = {
	data: T[];
	pageNumber: number;
	pageSize: number;
	totalRecords: number;
	totalPages: number;
};

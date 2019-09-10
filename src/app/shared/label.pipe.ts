import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'labelfilter',
    pure: false
})
export class LabelFilterPipe implements PipeTransform {
    transform(items, filter) {
        if (!items || !filter) {
            return items;
        }
        // filter items array, items which match and return true will be kept, false will be filtered out
        return items.filter((item) => this.applyFilter(item, filter));
    }

    /**
     * Perform the filtering.
     *
     * @param {Book} book The book to compare to the filter.
     * @param {Book} filter The filter to apply.
     * @return {boolean} True if book satisfies filters, false if not.
     */
    applyFilter(book, filter): boolean {
        for (let field in filter) {
            if (filter[field]) {
                if (typeof filter[field] === 'string') {
                    if (book[field].toLowerCase().indexOf(filter[field].toLowerCase()) === -1) {
                        return false;
                    }
                } else if (typeof filter[field] === 'number') {
                    if (book[field] !== filter[field]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}

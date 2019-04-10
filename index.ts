import { Observable, of, empty, from } from 'rxjs'; 
import { map, concat, concatMap, concatAll, expand, toArray, delay, tap } from 'rxjs/operators';

type Getter = (x: number) => Observable<number>;

const http = {
  1: [2, 6],
  2: [3, 4],
  4: [5],
  6: [7, 13, 14],
  7: [8, 9, 10, 11, 12],
  14: [15, 16],
  17: [18],
  18: [19],
  20: [21],
};

const getChildren = (id: number) =>
  (http[id] ? from(http[id] as number[]) : empty());

const getChildrenWithDelay = (id: number) =>
  getChildren(id).pipe(delay(Math.random() * 300));


class Test {
  // This doesn't maintain depth-first order; it can vary depending on timing.
  brokenDFS(getChildren: Getter, ids: number[]): Observable<number[]> {
    return of(ids).pipe(
      concatMap(ids => from(ids)),
      expand(id => getChildren(id)),
      toArray()
    );
  }

  workingDFS(getChildren: Getter, ids: number[]): Observable<number[]> {
    return from(ids).pipe(
      concatMap(id => this.parentAndChildren(getChildren, id)),
      toArray()
    );
  }

  private parentAndChildren(getChildren: Getter, id: number): Observable<number> {
    return of(id).pipe(
      concat(
        getChildren(id).pipe(
          map(child => this.parentAndChildren(getChildren, child)),
          concatAll()
        )
      ),
    );
  }

}

const getter = getChildrenWithDelay;
const rootIds = [1, 17, 20];
const test = new Test();
test.brokenDFS(getter, rootIds).subscribe(data => console.log(`Broken: ${data}`));
test.workingDFS(getter, rootIds).subscribe(data => console.log(`Working: ${data}`));

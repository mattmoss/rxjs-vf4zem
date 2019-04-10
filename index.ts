import { Observable, of, empty, from } from 'rxjs'; 
import { map, concatMap, expand, toArray, delay } from 'rxjs/operators';

type Getter = (x: number) => Observable<number[]>;

const http = {
  1: [8, 9],
  2: [4],
  4: [7],
  9: [22, 23, 24]
};
const getChildren = (id: number) =>
  (http[id] ? of(http[id] as number[]) : empty());

const getChildrenWithDelay = (id: number) =>
  getChildren(id).pipe(delay(Math.random() * 500));

const rootIds = of([1, 2, 3]);

const dfs = (getter: Getter) => rootIds.pipe(
  concatMap(ids => from(ids)),
  expand(id =>
    getter(id).pipe(
      concatMap(children => from(children))
    )
  ),
  toArray()
);

dfs(getChildren).subscribe(
  data => console.log(`dfs no delay: ${JSON.stringify(data)}`)
);

dfs(getChildrenWithDelay).subscribe(
  data => console.log(`dfs with delay: ${JSON.stringify(data)}`)
);

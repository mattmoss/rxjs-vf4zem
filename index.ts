;import { Observable, of, empty, from } from 'rxjs'; 
import { map, concat, concatMap, concatAll, expand, toArray, delay, tap } from 'rxjs/operators';

type Getter = (x: number) => Observable<number[]>;

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
  (http[id] ? of(http[id] as number[]) : empty());

const getChildrenWithDelay = (id: number) =>
  getChildren(id).pipe(delay(Math.random() * 300));

const rootIds = of([1, 17, 20]);

const dfs = (getter: Getter) => rootIds.pipe(
  concatMap(ids => from(ids)),
  expand(id =>
    getter(id).pipe(
      concatMap(children => from(children))
    )
  ),
  toArray()
);


const parentAndChildren = (getChildren: Getter, id: number) =>
  of(id).pipe(
    concat(
      getChildren(id).pipe(
        concatMap(children => 
          children.map(child => parentAndChildren(getChildren, child))
        ),
        concatAll()
      )
    ),
  );

const dfs2 = (getChildren: Getter, ids: number[]) =>
  from(ids).pipe(
    concatMap(id => parentAndChildren(getChildren, id)),
  );

// parentAndChildren(getChildrenWithDelay, 1).subscribe(data => console.log(data));
let allIds = [];
dfs2(getChildrenWithDelay, [1, 17, 20]).subscribe(
  data => {
    allIds.push(data);
    console.log(`Recv: ${data}`);
  },
  err => console.error(err),
  () => console.log(`Complete array: ${allIds}`)
);


// dfs(getChildren).subscribe(
//   data => console.log('dfs no delay: ' + data)
// );

// dfs(getChildrenWithDelay).subscribe(
//   data => console.log('dfs with delay: ' + data)
// );

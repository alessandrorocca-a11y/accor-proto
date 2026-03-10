# Table analysis — “All” column

**Figma:** [Web Appearances – ALL (Legacy)](https://www.figma.com/design/HXpmNTzVqJhYs57bt2UJ11/%F0%9F%8C%88-Web-Appearances?node-id=14-2&m=dev&vars=1&var-set-id=6030-4)  
**Node:** 14:2 (canvas “ALL (Legacy)”)

---

## What the table is

The frame is a **variable-set / mode table** for typography tokens. It shows how token values change per **mode** (column):

| Column   | Meaning / use |
|----------|----------------|
| **all**  | Default / “all brands” (Legacy) — generic fallback. |
| Pullman  | Brand: Pullman. |
| Sofitel  | Brand: Sofitel. |

So the table is: **rows = token names**, **columns = modes (all, Pullman, Sofitel)**.

---

## The “all” column only

From the layer names in the file, the **“all” column** has the same value for every typography row that lists it:

| Row (token / property) | **All** column value |
|------------------------|----------------------|
| font-default          | **Roboto**           |
| size-default          | **Roboto** *(label text reused for this row)* |
| line-height-default   | **Roboto**           |
| font-weight           | **Roboto**           |
| letter-spacing        | **Roboto**           |

So in this table:

- **“All” column = the value used when the mode is “all” (ALL Legacy).**
- For every row that shows `all: Roboto Pullman: Verdana Sofitel: Arial`, the **“all” value is Roboto**.  
  (Pullman = Verdana, Sofitel = Arial.)

So for the **“all”** column only:

- **Font / font-default:** **Roboto**
- Other typography rows that share the same cell text also resolve to **Roboto** for “all” in this view.

---

## Summary

- **“All” column** = values for the **ALL (Legacy)** variable set (var-set-id=6030-4).
- In this table, the **“all”** column uses **Roboto** for the typography tokens shown (font-default and the other rows that display the same “all: Roboto …” text).
- Use **Roboto** when you want the “all” / legacy default; use **Verdana** for Pullman and **Arial** for Sofitel when mapping from the other columns.

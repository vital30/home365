import { Component, OnInit, TemplateRef, AfterViewInit, ViewChild } from '@angular/core';
import { ServiceService} from '../_services/service.service';
import {MatPaginator, PageEvent } from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';


export interface UserData {
  propertyId: string;
  createdOn: string;
  address: string;
  occupiedStats: string;
  owner: string;
  ownerStatus: string;
  plan: string;
  tenant:string;
  tenantStatus:string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  properties:any[] = [];
  dataSource = new MatTableDataSource<UserData>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading = true;
  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;
  displayedColumns: string[] = ['createdOn', 'address', 'occupiedStats', 'plan', 'owner', 'ownerStatus', 'tenant', 'tenantStatus'];
  length:any
  lowValue: number = 0;
  highValue: number = 5;
  currentPage = 0;
  pageSize = 5;
  filterValues:any
  selectedProperty= false;
  selectedOwner = false;
  selectedTenant= false;
  selectedRow:any[] = [];
  filterSelectObj = [
    {
      name: 'Property Stats',
      columnProp: 'occupiedStats',
      options: ['Active','Occupied', 'Vacant',  'Inactive' ]
    }, {
      name: 'Tenant Status',
      columnProp: 'tenantStatus',
      options: ['Active','Inactive' ]
    }
  ]
  
  
  constructor(private dbService: ServiceService, public dialog: MatDialog) {
    this.filterValues = {}
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){
    this.dbService.getData().subscribe(data => {
      setTimeout(() => {
        this.isLoading = false;
        this.dataSource.data = data.properties;
        this.paginator.pageIndex = this.currentPage;
        this.paginator.length = data.properties.length;

        this.length = data.properties.length;
        this.dataSource.filterPredicate = this.createFilter();


      }, 2000)  
      
    },
    err => {
      throw err;
    });

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  pageChanged(event: PageEvent) {
    console.log({ event });
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadData();
  }


  //    // Called on Filter change
  filterChange(filter:any, event:any) {
    let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

    // Custom filter method fot Angular Material Datatable
    createFilter() {
      let filterFunction = function (data: any, filter: string): boolean {
        let searchTerms = JSON.parse(filter);
        let isFilterSet = false;
        for (const col in searchTerms) {
          if (searchTerms[col].toString() !== '') {
            isFilterSet = true;
          } else {
            delete searchTerms[col];
          }
        }
  
        console.log(searchTerms);
  
        let nameSearch = () => {
          let found = false;
          if (isFilterSet) {
            for (const col in searchTerms) {
              searchTerms[col].trim().toLowerCase().split(' ').forEach((word:any) => {
                if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
                  found = true
                }
              });
            }
            return found
          } else {
            return true;
          }
        }
        return nameSearch()
      }
      return filterFunction
    }

      // Reset table filters
  resetFilters() {
    this.filterValues = {}
    this.filterSelectObj.forEach((value:any, key) => {
      value.modelValue = undefined;
    })
    this.dataSource.filter = "";
  }

  OpenPropertyDialog(row:any){
    this.selectedProperty = true;
    this.selectedRow = row;

    const myTempDialog = this.dialog.open(this.dialogRef, { data: this.selectedRow });
    myTempDialog.afterClosed().subscribe((res) => {
      this.selectedProperty = false;
    });
  }

  OpenOwnerDialog(row:any){
    this.selectedOwner = true;
    this.selectedRow = row
    const myTempDialog = this.dialog.open(this.dialogRef, { data: this.selectedRow });
    myTempDialog.afterClosed().subscribe((res) => {
      this.selectedOwner = false;
    });
  }

  OpenTenantDialog(row:any){
    this.selectedTenant = true;
    this.selectedRow = row

    const myTempDialog = this.dialog.open(this.dialogRef, { data: this.selectedRow });
    myTempDialog.afterClosed().subscribe((res) => {
      this.selectedTenant = false;
    });
  }

}

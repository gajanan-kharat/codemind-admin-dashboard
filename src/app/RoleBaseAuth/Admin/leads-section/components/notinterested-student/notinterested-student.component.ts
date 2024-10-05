import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BATCHES, COURSES, DISPLAYED_COLUMNS } from 'src/app/models/admin-content';
import { MongodbService } from 'src/app/services/mongodb.service';
import { EditNotintrestedStudentComponent } from '../../dialogs/edit-notintrested-student/edit-notintrested-student.component';
import { NotInterestedStudentResponse } from 'src/app/models/notInterestedStudents';

@Component({
  selector: 'app-notinterested-student',
  templateUrl: './notinterested-student.component.html',
  styleUrls: ['./notinterested-student.component.scss']
})
export class NotinterestedStudentComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 
  filteredNotInterested = new MatTableDataSource<any>();
  notInterestedStudents: any[] =[];

  displayedColumns: string[] = DISPLAYED_COLUMNS;

  courses: string[] = COURSES; 
  batches: string[] = BATCHES;

  selectedCourseNotInterested = '';
  // selectedBatchNotInterested = '';

  totalPages: number = 0;
  currentPage: number = 1;
  limit: number = 10;
  totalRecords:number = 0;

  constructor(private mongodbService: MongodbService, private dialog: MatDialog, private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.fetchStudents();
  }

  ngAfterViewInit() {
    // this.filteredNotInterested.paginator = this.paginator;
    this.filteredNotInterested.sort = this.sort; 
  }

  fetchStudents(searchTerm: string = ''): void {
    this.mongodbService.getNotInterested(this.currentPage, this.limit, searchTerm).subscribe(
      (response:NotInterestedStudentResponse) => {
        const {totalRecords, totalPages, currentPage, data } = response;
        this.totalPages = totalPages;         
        this.currentPage = currentPage;       
        this.notInterestedStudents = data;
        this.totalRecords = totalRecords;
        this.filteredNotInterested.data = this.notInterestedStudents;
        this.filterNotInterested()  
      },
      (error) => {
        console.error('Error fetching follow-up students:', error);
      }
    );
  }
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex+1; 
    this.limit = event.pageSize; 
    this.fetchStudents();
  }
  
  refreshData(){
    this.notInterestedStudents = [];
    this.filteredNotInterested.data = [];
    this.selectedCourseNotInterested = '';
    // this.selectedBatchNotInterested = '';
    const searchInput = document.querySelector('input[matInput]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.fetchStudents();
  }

  filterNotInterested() {
    this.filteredNotInterested.data = this.notInterestedStudents.filter(student => {
      return (!this.selectedCourseNotInterested || student.course === this.selectedCourseNotInterested);
      // && (!this.selectedBatchNotInterested || student.batch === this.selectedBatchNotInterested);
    });
    if (this.filteredNotInterested.paginator) {
      this.filteredNotInterested.paginator.firstPage();
    }
    // Update paginator if needed
    // this.filteredNotInterested.paginator = this.paginator;
  }

  onBatchChange() {
    this.filterNotInterested(); 
  }

  onCourseChange() {
    this.filterNotInterested();
  }

  editNotInterestedStudent(student:any){
    const dialogRef = this.dialog.open(EditNotintrestedStudentComponent, {
      width: '50%',
      data: { student },
      maxWidth: '80vw', 
    minWidth: '300px',
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
       
          const index = this.notInterestedStudents .findIndex(s => s._id === student._id);
          if (index !== -1) {
            this.notInterestedStudents[index] = result;
            this.filterNotInterested();
            this.fetchStudents();
          }
        
      }
    });
  }

  applyFilterNotInterested(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.filteredNotInterested.filter = filterValue.trim().toLowerCase();
  
    if (this.filteredNotInterested.paginator) {
      this. filteredNotInterested.paginator.firstPage();
    }
  }

}

import React, { useState, useEffect, useCallback } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [loadingStage, SetLoadingStage] = useState("loading");
  const [studentList, setStudentList] = useState<{ students: Person[] }>();
  const [filterArray, setFilterArray] = useState<{ students: Person[] }>();
  const [sortOrder, setSortOrder] = useState(1);
  const [filterValue, setFilterValue] = useState(`first_name`);

  const [attendanceReport, setAttendanceReport] = useState([
    { type: "all", count: 0 },
    { type: "present", count: 0 },
    { type: "late", count: 0 },
    { type: "absent", count: 0 },
  ]);

  useEffect(() => {
    getStudents().then((data: any) => {
      setStudentList(data['result']);
      setFilterArray(data['result']);
      SetLoadingStage("loaded");
    })
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {

    if(action === "asc") {
      setSortOrder(1);
      setStudentList(sortObjectArray(filterArray, filterValue,1));
    } else if(action === "desc") {
      setSortOrder(-1);
      setStudentList(sortObjectArray(filterArray, filterValue,-1));
    }else if (action === "roll") {
      setIsRollMode(true);
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const sortObjectArray = (array: any, property: string, ascDescFlag : number) => {
    ascDescFlag = ascDescFlag || 1;
    array?.students.sort(function compare(obj1: any, obj2: any) {
        let returnValue = 0;
        if (obj1[property] > obj2[property]) {
          returnValue = 1 * ascDescFlag;
        } else if (obj1[property] < obj2[property]) {
          returnValue = -1 * ascDescFlag;
        }
        return returnValue;
    });
    return array; 
  }

  const onFilterChange = (action: filterAction) => {
    setFilterValue(action);
    setStudentList(sortObjectArray(filterArray, action,sortOrder));
  }


  const onSearchBarChange = (action: any) => {
    console.log("onSearchBarChange",action);
    let data = studentList?.students.filter(e =>e[`first_name`].toLowerCase().includes(action.toLowerCase()))
    setFilterArray({"students" : data})
  }

  const onStudentAttendanceChange = (id: any, value:any) => {
    studentList?.students.map((student) => {
      if(student[`id`] === id) {
        if(student['attendance']) {
          student['attendance'] = value;
        }else {
          student['attendance'] = value;
        }
      }
    });
    attendanceReport.map((data) => {
      data[`count`] = 0;
    })

    updateStudentAttendance();
  }

  const updateStudentAttendance = () => {
    let tempArray = attendanceReport;
    filterArray?.students.map((student) => {
      tempArray.map((data) => {
        if(data[`type`] === student[`attendance`]) {
          data[`count`] = data[`count`] + 1;
        }
      })
    })

    setAttendanceReport([...tempArray]);
  }

  const onRoleChange = (action: any) => {

    if(action === `all`) {
      setFilterArray(studentList)
    } else {
      let tempArray = studentList;
      
      let data = tempArray?.students.filter((student) => {
          return student[`attendance`] === action;
      })

      setFilterArray({"students" : data})
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} onFilterClick={onFilterChange} onSearchChange={onSearchBarChange} onRoleChange={onRoleChange} isShowRoleFilter={isRollMode}/>

        {loadingStage === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadingStage === "loaded" && filterArray?.students && filterArray?.students.length > 0 &&(
          <>
            {filterArray.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onAttendance={onStudentAttendanceChange} />
            ))}
          </>
        )}

        {loadingStage === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
    <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} attendance={attendanceReport} studentList={studentList}/>
    </>
  )
}

type ToolbarAction = "roll" | "asc" | "desc";
type filterAction = "first_name" | "last_name";
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  onFilterClick : (action: filterAction, value?: string) => void,
  onSearchChange : (action: any, value?: string) => void,
  onRoleChange : (action: any, value?: string) => void,
  isShowRoleFilter : any,
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [isAscSelected, setAscValue]  = useState (true);
  const [isFirstNameFilterSelected, setFilterValue] = useState (true);
  const { onItemClick, onFilterClick, onSearchChange,onRoleChange, isShowRoleFilter } = props
  return (
    <S.ToolbarContainer>
      <div onClick={() => {setAscValue(!isAscSelected); onItemClick(!isAscSelected ? "asc" : "desc")}}>
        {
          isAscSelected 
          ?
            "Ascending"
          :
            "Descending"
        }
      </div>

      <div onClick={() => {setFilterValue(!isFirstNameFilterSelected); onFilterClick(!isFirstNameFilterSelected ? 'first_name' : 'last_name')}}>
        {
          isFirstNameFilterSelected 
          ?
            "FirstName"
          :
            "LastName"
        }
      </div>

      <div>
          <input type="text" placeholder="Search" onChange={(e) => {onSearchChange(e.target.value)}}/>
      </div>

      {
        isShowRoleFilter &&
        <div>
            <select onChange={(e) => onRoleChange(e.target.value)}>
            <option value="">Select Roll</option>
            <option value="all">all</option>
            <option value="present">present</option>
            <option value="absent">absent</option>
            <option value="late">late</option>
            </select>
        </div>
      }
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}
